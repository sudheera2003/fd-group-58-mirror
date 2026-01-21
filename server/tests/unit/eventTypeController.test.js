const { deleteEventType } = require("../../controllers/eventTypesController");
const Event = require("../../models/Event");
const EventType = require("../../models/EventType");
const httpMocks = require("node-mocks-http");

jest.mock("../../models/Event");
jest.mock("../../models/EventType");

describe("Event Type Controller Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should prevent deleting event type if it is assigned to an event", async () => {
    const req = httpMocks.createRequest({
      params: { id: "eventType_123" },
      io: { emit: jest.fn() },
    });
    const res = httpMocks.createResponse();

    Event.findOne.mockResolvedValue({ 
      _id: "event_999", 
      name: "Existing Event" 
    });

    await deleteEventType(req, res);

    expect(res.statusCode).toBe(400); 
    const data = res._getJSONData();
    expect(data.message).toBe("Cannot delete event type: Event type is assigned to an existing event");
    expect(EventType.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it("should successfully delete an event type if it is not in use", async () => {
    const req = httpMocks.createRequest({
      params: { id: "eventType_123" },
      io: { emit: jest.fn() },
    });
    const res = httpMocks.createResponse();

    Event.findOne.mockResolvedValue(null);

    EventType.findByIdAndDelete.mockResolvedValue({ _id: "eventType_123", name: "Old Type" });

    await deleteEventType(req, res);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data.message).toBe("Event Type deleted successfully");
    expect(EventType.findByIdAndDelete).toHaveBeenCalledWith("eventType_123");
    expect(req.io.emit).toHaveBeenCalledWith("eventType_update", { action: "delete", id: "eventType_123" });
  });

  it("should return 404 if the event type to delete is not found", async () => {
    const req = httpMocks.createRequest({
      params: { id: "non_existent_id" },
      io: { emit: jest.fn() },
    });
    const res = httpMocks.createResponse();

    Event.findOne.mockResolvedValue(null); 
    EventType.findByIdAndDelete.mockResolvedValue(null); 

    await deleteEventType(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData().message).toBe("Type not found");
  });
});