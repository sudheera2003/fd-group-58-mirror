const { deleteVenue } = require("../../controllers/venueController");
const Event = require("../../models/Event");
const Venue = require("../../models/Venue");
const httpMocks = require("node-mocks-http");

jest.mock("../../models/Event");
jest.mock("../../models/Venue");

describe("Venue Controller Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should prevent deleting venue if it is assigned to an event", async () => {
    const req = httpMocks.createRequest({
      params: { id: "venue_123" },
    });
    const res = httpMocks.createResponse();

    Event.findOne.mockResolvedValue({ 
      _id: "event_999", 
      name: "Existing Event" 
    });

    await deleteVenue(req, res);

    expect(res.statusCode).toBe(400); 
    const data = res._getJSONData();
    expect(data.message).toBe("Venue is assigned to an existing event");
    expect(Venue.findByIdAndDelete).not.toHaveBeenCalled();
  });
});