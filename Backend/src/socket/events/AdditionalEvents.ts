import UserModel from "@/api/admin/user/userSchema";
import * as Cheerio from "cheerio";
import { Socket, Server } from "socket.io";

export const additionalEvents = (socket: Socket, io: Server) => {
  socket.on("additional:metadataReader", async ({ url, messageId }) => {
    try {
      const response = await fetch(url);
      const html = await response.text();

      const $ = Cheerio.load(html);

      const metadata = {
        messageId,
        title:
          $('meta[property="og:title"]').attr("content") || $("title").text(),
        description:
          $('meta[property="og:description"]').attr("content") ||
          $('meta[name="description"]').attr("content"),
        image: $('meta[property="og:image"]').attr("content"),
        url: $('meta[property="og:url"]').attr("content") || url,
      };
      io.emit("additional:metadataReaderResponse", { metadata });
    } catch (error) {
      console.error("Error fetching metadata:", error);
      io.to(userId).emit("error", {
        message: "Failed to fetch metadata",
      });
    }
  });
};
