import requests
from typing import Optional, List, Dict
from config import get_settings

settings = get_settings()


class CodewarsService:
    BASE_URL = "https://www.codewars.com/api/v1"
    
    def __init__(self):
        self.api_key = settings.codewars_api_key
        self.headers = {
            "Authorization": self.api_key
        } if self.api_key else {}
    
    def get_kata_by_id(self, kata_id: str) -> Optional[Dict]:
        """Fetch a specific kata by ID"""
        try:
            url = f"{self.BASE_URL}/code-challenges/{kata_id}"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching kata {kata_id}: {e}")
            return None
    
    def search_katas(self, query: str = "", difficulty: Optional[str] = None) -> List[Dict]:
        """
        Search for katas. Note: Codewars API has limited search capabilities.
        This is a simplified version.
        """
        # Codewars API doesn't have a direct search endpoint
        # You would typically maintain a list of kata IDs or use their website
        # For demo purposes, return some popular kata IDs
        popular_katas = [
            "5266876b8f4bf2da9b000362",  # Likes vs Dislikes
            "54da5a58ea159efa38000836",  # Find the odd int
            "5264d2b162488dc400000001",  # Stop gninnipS My sdroW!
            "5667e8f4e3f572a8f2000039",  # Mumbling
            "5390bac347d09b7da40006f6",  # Jaden Casing Strings
        ]
        
        results = []
        for kata_id in popular_katas[:5]:  # Limit to 5 for demo
            kata = self.get_kata_by_id(kata_id)
            if kata:
                results.append(kata)
        
        return results
    
    def format_kata_for_question(self, kata: Dict) -> Dict:
        """Format a Codewars kata into our question format"""
        return {
            "title": kata.get("name", ""),
            "description": kata.get("description", ""),
            "codewars_kata_id": kata.get("id", ""),
            "difficulty": kata.get("rank", {}).get("name", ""),
            "tags": kata.get("tags", []),
            "languages": kata.get("languages", []),
        }


# Singleton instance
codewars_service = CodewarsService()
