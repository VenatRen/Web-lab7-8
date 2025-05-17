
import { AmpqProvider } from "./ampq/ampq.service.js";
import queueConfig from "../../api/src/config/queue.js";
import { Handler } from "./mail/index.js";

await AmpqProvider.connect(queueConfig);

AmpqProvider.subscribeToEvent('greetings', Handler.createUserHandler);