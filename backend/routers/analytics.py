from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta
import json

from database import get_db
from models import Assessment, Submission, Question, Answer, User, Invitation
from auth import get_current_user
from schemas import UserRole

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

def require_recruiter(current_user = Depends(get_current_user)):
    """Require recruiter role for analytics endpoints"""
    if current_user.role != UserRole.RECRUITER:
        raise HTTPException(status_code=403, detail="Only recruiters can access analytics")
    return current_user

@router.get("/overview")
def get_analytics_overview(
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db),
    assessment_id: Optional[int] = Query(None),
    days: Optional[int] = Query(30)
):
    """Get comprehensive analytics overview"""
    try:
        # Date filter
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Base query for recruiter's assessments
        base_query = db.query(Assessment).filter(Assessment.creator_id == current_user.id)
        if assessment_id:
            base_query = base_query.filter(Assessment.id == assessment_id)
        
        assessments = base_query.all()
        assessment_ids = [a.id for a in assessments]
        
        if not assessment_ids:
            return {
                "total_assessments": 0,
                "total_invitations": 0,
                "total_submissions": 0,
                "completion_rate": 0,
                "average_score": 0,
                "pass_rate": 0,
                "time_stats": {},
                "performance_trends": []
            }
        
        # Basic stats
        total_assessments = len(assessments)
        
        # Invitations stats
        invitations = db.query(Invitation).filter(Invitation.assessment_id.in_(assessment_ids)).all()
        total_invitations = len(invitations)
        accepted_invitations = len([i for i in invitations if i.status == 'accepted'])
        
        # Submissions stats
        submissions = db.query(Submission).filter(
            and_(
                Submission.assessment_id.in_(assessment_ids),
                Submission.submitted_at >= start_date
            )
        ).all()
        
        total_submissions = len(submissions)
        graded_submissions = [s for s in submissions if s.status == 'graded']
        
        # Completion rate
        completion_rate = (accepted_invitations / total_invitations * 100) if total_invitations > 0 else 0
        
        # Score stats
        if graded_submissions:
            scores = [(s.score / s.max_score) * 100 for s in graded_submissions if s.max_score > 0]
            average_score = sum(scores) / len(scores) if scores else 0
            pass_rate = len([s for s in scores if s >= 70]) / len(scores) * 100 if scores else 0
        else:
            average_score = 0
            pass_rate = 0
        
        # Time analysis
        time_stats = calculate_time_stats(submissions)
        
        # Performance trends (last 7 days)
        performance_trends = calculate_performance_trends(db, assessment_ids, days=7)
        
        return {
            "total_assessments": total_assessments,
            "total_invitations": total_invitations,
            "accepted_invitations": accepted_invitations,
            "total_submissions": total_submissions,
            "graded_submissions": len(graded_submissions),
            "completion_rate": round(completion_rate, 2),
            "average_score": round(average_score, 2),
            "pass_rate": round(pass_rate, 2),
            "time_stats": time_stats,
            "performance_trends": performance_trends
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating analytics: {str(e)}")

@router.get("/question-analysis")
def get_question_analysis(
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db),
    assessment_id: Optional[int] = Query(None)
):
    """Get detailed question performance analysis"""
    try:
        # Get recruiter's assessments
        base_query = db.query(Assessment).filter(Assessment.creator_id == current_user.id)
        if assessment_id:
            base_query = base_query.filter(Assessment.id == assessment_id)
        
        assessments = base_query.all()
        assessment_ids = [a.id for a in assessments]
        
        if not assessment_ids:
            return []
        
        # Get all questions for these assessments
        questions = db.query(Question).filter(Question.assessment_id.in_(assessment_ids)).all()
        
        question_analysis = []
        
        for question in questions:
            # Get all answers for this question
            answers = db.query(Answer).filter(Answer.question_id == question.id).all()
            
            if not answers:
                continue
            
            total_attempts = len(answers)
            correct_answers = len([a for a in answers if a.points_earned and a.points_earned >= question.points * 0.7])
            avg_score = sum([a.points_earned or 0 for a in answers]) / total_attempts
            max_score = question.points
            difficulty_percentage = (correct_answers / total_attempts) * 100 if total_attempts > 0 else 0
            
            # Analyze answer patterns
            answer_patterns = analyze_answer_patterns(question, answers)
            
            question_analysis.append({
                "question_id": question.id,
                "question_title": question.title,
                "question_type": question.question_type,
                "assessment_title": next((a.title for a in assessments if a.id == question.assessment_id), "Unknown"),
                "total_attempts": total_attempts,
                "correct_answers": correct_answers,
                "avg_score": round(avg_score, 2),
                "max_score": max_score,
                "avg_score_percentage": round((avg_score / max_score) * 100, 2) if max_score > 0 else 0,
                "difficulty_percentage": round(difficulty_percentage, 2),
                "difficulty_level": get_difficulty_level(difficulty_percentage),
                "answer_patterns": answer_patterns
            })
        
        # Sort by difficulty (hardest first)
        question_analysis.sort(key=lambda x: x['difficulty_percentage'])
        
        return question_analysis
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing questions: {str(e)}")

@router.get("/candidate-performance")
def get_candidate_performance(
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db),
    assessment_id: Optional[int] = Query(None),
    limit: Optional[int] = Query(50)
):
    """Get candidate performance rankings and detailed analysis"""
    try:
        # Get recruiter's assessments
        base_query = db.query(Assessment).filter(Assessment.creator_id == current_user.id)
        if assessment_id:
            base_query = base_query.filter(Assessment.id == assessment_id)
        
        assessments = base_query.all()
        assessment_ids = [a.id for a in assessments]
        
        if not assessment_ids:
            return []
        
        # Get submissions with candidate info
        submissions = db.query(Submission).filter(
            and_(
                Submission.assessment_id.in_(assessment_ids),
                Submission.status == 'graded'
            )
        ).all()
        
        candidate_performance = []
        
        # Group by candidate
        candidates = {}
        for submission in submissions:
            candidate_id = submission.interviewee_id
            if candidate_id not in candidates:
                candidates[candidate_id] = {
                    "candidate_id": candidate_id,
                    "candidate_name": submission.interviewee.full_name or submission.interviewee.username,
                    "candidate_email": submission.interviewee.email,
                    "submissions": [],
                    "total_assessments": 0,
                    "total_score": 0,
                    "total_max_score": 0,
                    "average_score": 0,
                    "best_score": 0,
                    "worst_score": 100,
                    "completion_time_total": 0
                }
            
            candidate_data = candidates[candidate_id]
            score_percentage = (submission.score / submission.max_score) * 100 if submission.max_score > 0 else 0
            
            # Calculate completion time
            completion_time = None
            if submission.started_at and submission.submitted_at:
                completion_time = (submission.submitted_at - submission.started_at).total_seconds() / 60  # in minutes
            
            submission_data = {
                "submission_id": submission.id,
                "assessment_id": submission.assessment_id,
                "assessment_title": next((a.title for a in assessments if a.id == submission.assessment_id), "Unknown"),
                "score": submission.score,
                "max_score": submission.max_score,
                "score_percentage": round(score_percentage, 2),
                "submitted_at": submission.submitted_at.isoformat() if submission.submitted_at else None,
                "completion_time_minutes": round(completion_time, 2) if completion_time else None,
                "status": submission.status
            }
            
            candidate_data["submissions"].append(submission_data)
            candidate_data["total_assessments"] += 1
            candidate_data["total_score"] += submission.score
            candidate_data["total_max_score"] += submission.max_score
            candidate_data["best_score"] = max(candidate_data["best_score"], score_percentage)
            candidate_data["worst_score"] = min(candidate_data["worst_score"], score_percentage)
            if completion_time:
                candidate_data["completion_time_total"] += completion_time
        
        # Calculate averages and finalize
        for candidate_id, candidate_data in candidates.items():
            if candidate_data["total_max_score"] > 0:
                candidate_data["average_score"] = round((candidate_data["total_score"] / candidate_data["total_max_score"]) * 100, 2)
            else:
                candidate_data["average_score"] = 0
            
            if candidate_data["total_assessments"] > 0:
                candidate_data["avg_completion_time"] = round(candidate_data["completion_time_total"] / candidate_data["total_assessments"], 2)
            else:
                candidate_data["avg_completion_time"] = 0
            
            # Remove temporary fields
            del candidate_data["total_score"]
            del candidate_data["total_max_score"]
            del candidate_data["completion_time_total"]
            
            candidate_performance.append(candidate_data)
        
        # Sort by average score (highest first)
        candidate_performance.sort(key=lambda x: x['average_score'], reverse=True)
        
        return candidate_performance[:limit]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing candidate performance: {str(e)}")

@router.get("/assessment-comparison")
def get_assessment_comparison(
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Compare performance across different assessments"""
    try:
        # Get recruiter's assessments
        assessments = db.query(Assessment).filter(Assessment.creator_id == current_user.id).all()
        
        comparison_data = []
        
        for assessment in assessments:
            # Get submissions for this assessment
            submissions = db.query(Submission).filter(
                Submission.assessment_id == assessment.id
            ).all()
            
            total_submissions = len(submissions)
            graded_submissions = [s for s in submissions if s.status == 'graded']
            
            if not graded_submissions:
                continue
            
            # Calculate statistics
            scores = [(s.score / s.max_score) * 100 for s in graded_submissions if s.max_score > 0]
            average_score = sum(scores) / len(scores) if scores else 0
            pass_rate = len([s for s in scores if s >= 70]) / len(scores) * 100 if scores else 0
            
            # Question analysis
            questions = db.query(Question).filter(Question.assessment_id == assessment.id).all()
            total_questions = len(questions)
            
            # Time analysis
            completion_times = []
            for submission in submissions:
                if submission.started_at and submission.submitted_at:
                    time_diff = (submission.submitted_at - submission.started_at).total_seconds() / 60
                    completion_times.append(time_diff)
            
            avg_completion_time = sum(completion_times) / len(completion_times) if completion_times else 0
            
            comparison_data.append({
                "assessment_id": assessment.id,
                "assessment_title": assessment.title,
                "total_questions": total_questions,
                "total_submissions": total_submissions,
                "graded_submissions": len(graded_submissions),
                "completion_rate": round((len(graded_submissions) / total_submissions) * 100, 2) if total_submissions > 0 else 0,
                "average_score": round(average_score, 2),
                "pass_rate": round(pass_rate, 2),
                "avg_completion_time_minutes": round(avg_completion_time, 2),
                "difficulty_score": calculate_assessment_difficulty(assessment, graded_submissions),
                "created_at": assessment.created_at.isoformat(),
                "published_at": assessment.published_at.isoformat() if assessment.published_at else None
            })
        
        # Sort by average score
        comparison_data.sort(key=lambda x: x['average_score'], reverse=True)
        
        return comparison_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error comparing assessments: {str(e)}")

# Helper functions
def calculate_time_stats(submissions):
    """Calculate time-based statistics"""
    completion_times = []
    for submission in submissions:
        if submission.started_at and submission.submitted_at:
            time_diff = (submission.submitted_at - submission.started_at).total_seconds() / 60
            completion_times.append(time_diff)
    
    if not completion_times:
        return {}
    
    return {
        "avg_completion_time": round(sum(completion_times) / len(completion_times), 2),
        "min_completion_time": round(min(completion_times), 2),
        "max_completion_time": round(max(completion_times), 2),
        "median_completion_time": round(sorted(completion_times)[len(completion_times) // 2], 2)
    }

def calculate_performance_trends(db, assessment_ids, days=7):
    """Calculate performance trends over time"""
    trends = []
    for i in range(days):
        date = datetime.utcnow() - timedelta(days=i)
        date_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        date_end = date.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        submissions = db.query(Submission).filter(
            and_(
                Submission.assessment_id.in_(assessment_ids),
                Submission.submitted_at.between(date_start, date_end),
                Submission.status == 'graded'
            )
        ).all()
        
        if submissions:
            scores = [(s.score / s.max_score) * 100 for s in submissions if s.max_score > 0]
            avg_score = sum(scores) / len(scores) if scores else 0
        else:
            avg_score = 0
        
        trends.append({
            "date": date_start.strftime("%Y-%m-%d"),
            "submissions_count": len(submissions),
            "average_score": round(avg_score, 2)
        })
    
    return list(reversed(trends))

def analyze_answer_patterns(question, answers):
    """Analyze patterns in answers"""
    patterns = {}
    
    if question.question_type == "multiple_choice":
        # Count option selections
        option_counts = {}
        for answer in answers:
            if answer.answer_text:
                option = answer.answer_text.strip()
                option_counts[option] = option_counts.get(option, 0) + 1
        
        patterns["option_distribution"] = option_counts
        patterns["most_common_option"] = max(option_counts.items(), key=lambda x: x[1])[0] if option_counts else None
    
    elif question.question_type == "coding":
        # Analyze code submissions
        code_lengths = []
        for answer in answers:
            if answer.code_solution:
                code_lengths.append(len(answer.code_solution))
        
        if code_lengths:
            patterns["avg_code_length"] = round(sum(code_lengths) / len(code_lengths), 2)
            patterns["min_code_length"] = min(code_lengths)
            patterns["max_code_length"] = max(code_lengths)
    
    return patterns

def get_difficulty_level(percentage):
    """Get difficulty level based on success rate"""
    if percentage >= 80:
        return "Easy"
    elif percentage >= 60:
        return "Medium"
    elif percentage >= 40:
        return "Hard"
    else:
        return "Very Hard"

def calculate_assessment_difficulty(assessment, submissions):
    """Calculate overall difficulty score for an assessment"""
    if not submissions:
        return 0
    
    scores = [(s.score / s.max_score) * 100 for s in submissions if s.max_score > 0]
    avg_score = sum(scores) / len(scores) if scores else 0
    
    # Difficulty score (inverse of average score, scaled 0-100)
    difficulty_score = max(0, 100 - avg_score)
    return round(difficulty_score, 2)
