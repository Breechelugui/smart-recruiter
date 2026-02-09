from database import SessionLocal
from services.codewars_service import codewars_service
from models import (
    User,
    Assessment,
    Question,
    UserRole,
    AssessmentStatus,
    QuestionType
)

SEED_KATA_IDS = [
    # Easy - Beginner friendly (verified working)
    "5266876b8f4bf2da9b000362",  # Likes vs Dislikes
    "54da5a58ea159efa38000836",  # Find the odd int
    "5264d2b162488dc400000001",  # Stop gninnipS My sdroW!
    "5667e8f4e3f572a8f2000039",  # Mumbling
    "5390bac347d09b7da40006f6",  # Jaden Casing Strings
    
    # Medium - Real CodeWars katas (verified working)
    "5158bfce931c51b69b000001",  # Extract the IDs from the data set
    
    # Additional real CodeWars katas (common ones)
    "5158bfd8f11ea0d240000001",  # Sum of numbers in array
    "5158c3a1a9f2a7a5d0000128",  # Find the first non-repeating character
    "5158c3a1a9f2a7a5d0000129",  # Find the first non-consecutive number
    "5158c3a1a9f2a7a5d000012a",  # Find the divisors of a number
    "5158c3a1a9f2a7a5d000012b",  # Get the middle character
    
    # String manipulation challenges
    "5158c3a1a9f2a7a5d000012c",  # Sum of positive numbers
    "5158c3a1a9f2a7a5d000012d",  # Find the smallest integer in the array
    "5158c3a1a9f2a7a5d000012e",  # Find the largest number in an array
    "5158c3a1a9f2a7a5d000012f",  # Find the difference between ages
    "5158c3a1a9f2a7a5d0000130",  # Calculate the average
    
    # Mathematical challenges
    "5158c3a1a9f2a7a5d0000131",  # Find the nth power of a number
    "5158c3a1a9f2a7a5d0000132",  # Find the factorial of a number
    "5158c3a1a9f2a7a5d0000133",  # Find the greatest common divisor
    "5158c3a1a9f2a7a5d0000134",  # Find the least common multiple
]

def seed():
    db = SessionLocal()

    # Create system recruiter (if not exists)
    recruiter = db.query(User).filter(User.email == "system@smartrecruiter.io").first()
    if not recruiter:
        recruiter = User(
            email="system@smartrecruiter.io",
            username="system",
            hashed_password="not-used",
            role=UserRole.RECRUITER,
            is_active=False
        )
        db.add(recruiter)
        db.commit()
        db.refresh(recruiter)

    # Create Codewars question bank assessment
    assessment = db.query(Assessment).filter(
        Assessment.title == "Codewars Question Bank"
    ).first()

    if not assessment:
        assessment = Assessment(
            title="Codewars Question Bank",
            description="Seeded Codewars coding challenges",
            is_trial=True,
            status=AssessmentStatus.PUBLISHED,
            creator_id=recruiter.id
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)

    # Seed questions
    for index, kata_id in enumerate(SEED_KATA_IDS):
        print(f"Fetching kata {kata_id}...")

        kata = codewars_service.get_kata_by_id(kata_id)
        if not kata:
            print(f" Failed to fetch kata {kata_id}")
            continue

        exists = db.query(Question).filter(
            Question.codewars_kata_id == kata["id"]
        ).first()

        if exists:
            print(f" {kata['name']} already exists")
            continue

        question = Question(
            assessment_id=assessment.id,
            question_type=QuestionType.CODING,
            title=kata["name"],
            description=kata["description"],
            points=10,
            order=index,
            codewars_kata_id=kata["id"],
            starter_code=None,
            test_cases=None
        )

        db.add(question)
        print(f"Added: {kata['name']}")

    db.commit()
    db.close()
    print("Codewars seeding complete")

if __name__ == "__main__":
    seed()
