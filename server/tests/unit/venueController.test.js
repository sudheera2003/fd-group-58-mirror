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
      io: { emit: jest.fn() },
    });
    const res = httpMocks.createResponse();

    Event.findOne.mockResolvedValue({ 
      _id: "event_999", 
      name: "Existing Event" 
    });

    await deleteVenue(req, res);

    expect(res.statusCode).toBe(400); 
    const data = res._getJSONData();
    expect(data.message).toBe("Cannot delete venue: Venue is assigned to an existing event");
    expect(Venue.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it("should successfully delete a venue if it is not in use", async () => {
    const req = httpMocks.createRequest({
      params: { id: "venue_123" },
      io: { emit: jest.fn() },
    });
    const res = httpMocks.createResponse();

    Event.findOne.mockResolvedValue(null);

    Venue.findByIdAndDelete.mockResolvedValue({ _id: "venue_123", name: "Old Venue" });

    await deleteVenue(req, res);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data.message).toBe("Venue deleted successfully");
    expect(Venue.findByIdAndDelete).toHaveBeenCalledWith("venue_123");
    expect(req.io.emit).toHaveBeenCalledWith("venue_update", { action: "delete", id: "venue_123" });
  });

  it("should return 404 if the venue to delete is not found", async () => {
    const req = httpMocks.createRequest({
      params: { id: "non_existent_id" },
      io: { emit: jest.fn() },
    });
    const res = httpMocks.createResponse();

    Event.findOne.mockResolvedValue(null); 

    Venue.findByIdAndDelete.mockResolvedValue(null); 

    await deleteVenue(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData().message).toBe("Venue not found");
  });
});