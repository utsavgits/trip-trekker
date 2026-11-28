
const BASE_URL = "http://localhost:5000/api/flights";

const testPriceVerification = async () => {
  try {
    console.log("1. Searching flights...");

    const searchResponse = await fetch(`${BASE_URL}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Warsaw",
        to: "Frankfurt",
        departureDate: "2026-12-15",
        adults: 1
      })
    });

    const searchResult = await searchResponse.json();

    if (!searchResponse.ok || !searchResult.success) {
      console.log("Flight search failed:");
      console.log(searchResult);
      return;
    }

    const flightOptions = searchResult.data?.flights_options || [];

    const selectedOffer = flightOptions
      .flatMap(option => option.offers || [])
      .find(offer => offer.id);

    if (!selectedOffer) {
      console.log("No flight offers available for this route.");
      return;
    }

    console.log("Flight offer found:", selectedOffer.id);

    console.log("\n2. Verifying flight price...");

    const priceResponse = await fetch(
      `${BASE_URL}/offers/${encodeURIComponent(selectedOffer.id)}/price`,
      {
        method: "PATCH"
      }
    );

    const priceResult = await priceResponse.json();

    console.log("\nPrice Verification Status:", priceResponse.status);
    console.log(JSON.stringify(priceResult, null, 2));

  } catch (error) {
    console.error("Test Error:", error.message);
  }
};

testPriceVerification();
