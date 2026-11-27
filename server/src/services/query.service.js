import Query from "../models/Query.js";
import { crudService } from "./base.service.js";
import { sendQueryResolvedEmail } from "./mail.service.js";

const queries = crudService(Query);

export default {
  ...queries,
  async updateStatus(id, status) {
    const query = await queries.get(id);
    if (status === "resolved" && query.status !== "resolved") {
      await sendQueryResolvedEmail(query);
    }
    return queries.update(id, { status });
  },
};
