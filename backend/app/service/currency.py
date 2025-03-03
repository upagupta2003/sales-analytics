import os
import httpx
from fastapi import HTTPException
from functools import lru_cache
from datetime import datetime, timedelta

class CurrencyExchangeService:
    def __init__(self):
        self.api_key = os.getenv('EXCHANGE_RATE_API_KEY')
        if not self.api_key:
            raise ValueError("EXCHANGE_RATE_API_KEY environment variable is not set")
        self.base_url = f"https://v6.exchangerate-api.com/v6/{self.api_key}/pair"
        self._cache = {}
        self._cache_ttl = timedelta(hours=1)  # Cache rates for 1 hour

    async def get_conversion_rate(self, from_currency: str, to_currency: str = "USD") -> float:
        """Get the conversion rate from one currency to another with caching."""
        if from_currency == to_currency:
            return 1.0

        cache_key = f"{from_currency}_{to_currency}"
        
        # Check cache
        cached_data = self._cache.get(cache_key)
        if cached_data:
            rate, timestamp = cached_data
            if datetime.now() - timestamp < self._cache_ttl:
                return rate

        # Fetch new rate
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/{from_currency}/{to_currency}")
                response.raise_for_status()
                data = response.json()
                
                if data.get("result") == "success":
                    rate = data["conversion_rate"]
                    self._cache[cache_key] = (rate, datetime.now())
                    return rate
                else:
                    raise HTTPException(status_code=400, detail="Failed to get exchange rate")
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=f"Currency conversion error: {str(e)}")

    async def convert_to_usd(self, amount: float, from_currency: str) -> float:
        """Convert an amount from given currency to USD."""
        rate = await self.get_conversion_rate(from_currency, "USD")
        return round(amount * rate, 2)

# Global instance
currency_service = CurrencyExchangeService()
