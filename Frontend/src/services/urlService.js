import axios from "../api/axios";

export const urlService = {
  // Shorten a URL and get back the Shard info
  shorten: async (longUrl) => {
    const response = await axios.post("/shorten", { longUrl });
    return response.data;
  },

  // Fetch the list of URLs for the user
  getUrls: async () => {
    const response = await axios.get("/my-urls"); // Ensure you have this route in backend
    return response.data;
  },
};
