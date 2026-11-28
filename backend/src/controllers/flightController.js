
import { getAirportCode } from "../utils/airportCodes.js";

const getDRCTHeaders = () => ({
  Authorization: `Bearer ${process.env.DRCT_API_KEY}`,
  "Content-Type": "application/json",
  Accept: "application/json",
  "DRCT-Version": "2026-09-01"
});

const isDRCTConfigured = () =>
  process.env.DRCT_API_KEY && process.env.DRCT_BASE_URL;

const searchFlights = async (req, res) => {
  try {
    const {
      from,
      to,
      departureDate,
      adults = 1
    } = req.body;

    if (!from || !to || !departureDate) {
      return res.status(400).json({
        success: false,
        message: "Departure city, destination city and departure date are required."
      });
    }

    const departureAirport = getAirportCode(from);
    const arrivalAirport = getAirportCode(to);

    if (!departureAirport) {
      return res.status(400).json({
        success: false,
        message: `Flights are currently not supported from ${from}.`
      });
    }

    if (!arrivalAirport) {
      return res.status(400).json({
        success: false,
        message: `Flights are currently not supported to ${to}.`
      });
    }

    if (departureAirport === arrivalAirport) {
      return res.status(400).json({
        success: false,
        message: "Departure and destination cities cannot be the same."
      });
    }

    if (
      typeof departureDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(departureDate) ||
      Number.isNaN(Date.parse(`${departureDate}T00:00:00Z`))
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid departure date."
      });
    }

    if (
      !Number.isInteger(Number(adults)) ||
      Number(adults) < 1 ||
      Number(adults) > 9
    ) {
      return res.status(400).json({
        success: false,
        message: "Number of adults must be between 1 and 9."
      });
    }

    if (!isDRCTConfigured()) {
      return res.status(500).json({
        success: false,
        message: "Flight search API is not configured."
      });
    }

    const passengers = Array.from(
      { length: Number(adults) },
      () => ({ type: "ADT" })
    );

    const searchData = {
      flights: [
        {
          departure_airport_code: departureAirport,
          arrival_airport_code: arrivalAirport,
          departure_date: departureDate
        }
      ],
      passengers
    };

    const baseUrl = process.env.DRCT_BASE_URL.replace(/\/+$/, "");

    const response = await fetch(`${baseUrl}/offers_search`, {
      method: "POST",
      headers: getDRCTHeaders(),
      body: JSON.stringify(searchData)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("DRCT Search API Error:", data);

      return res.status(response.status).json({
        success: false,
        message: "Unable to fetch flights from the provider.",
        error: data
      });
    }

    return res.status(200).json({
      success: true,
      message: "Flights fetched successfully.",
      searchedRoute: {
        from,
        to,
        departureAirport,
        arrivalAirport,
        departureDate
      },
      data
    });

  } catch (error) {
    console.error("Flight Search Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while searching flights."
    });
  }
};

// Verify the latest price of a selected flight offer
const priceFlight = async (req, res) => {
  try {
    const { offerId } = req.params;

    if (!offerId || typeof offerId !== "string") {
      return res.status(400).json({
        success: false,
        message: "A valid flight offer ID is required."
      });
    }

    if (!isDRCTConfigured()) {
      return res.status(500).json({
        success: false,
        message: "Flight booking API is not configured."
      });
    }

    const baseUrl = process.env.DRCT_BASE_URL.replace(/\/+$/, "");

    const response = await fetch(
      `${baseUrl}/offers/${encodeURIComponent(offerId)}/price`,
      {
        method: "PATCH",
        headers: getDRCTHeaders()
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("DRCT Price API Error:", data);

      return res.status(response.status).json({
        success: false,
        message: "Unable to verify the selected flight price.",
        error: data
      });
    }

    return res.status(200).json({
      success: true,
      message: "Flight price verified successfully.",
      data
    });

  } catch (error) {
    console.error("Flight Price Verification Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while verifying the flight price."
    });
  }
};

export { searchFlights, priceFlight };
