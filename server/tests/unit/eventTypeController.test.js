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
    });
    const res = httpMocks.createResponse();

    Event.findOne.mockResolvedValue({ 
      _id: "event_999", 
      name: "Existing Event" 
    });

    await deleteEventType(req, res);

    expect(res.statusCode).toBe(400); 
    const data = res._getJSONData();
    expect(data.message).toBe("Event Type is assigned to an existing event");
    expect(EventType.findByIdAndDelete).not.toHaveBeenCalled();
  });
});