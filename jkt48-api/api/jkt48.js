import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const url = "https://akb48.fandom.com/wiki/Category:JKT48_Songs";
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const songs = [];

    $(".category-page__member-link").each((i, el) => {
      const title = $(el).text().trim();
      const link = "https://akb48.fandom.com" + $(el).attr("href");
      songs.push({ title, link });
    });

    res.setHeader("Access-Control-Allow-Origin", "*"); // biar bebas diakses
    res.status(200).json({
      source: "https://akb48.fandom.com/wiki/Category:JKT48_Songs",
      total: songs.length,
      songs,
    });
  } catch (err) {
    res.status(500).json({
      error: "Gagal mengambil data",
      message: err.message,
    });
  }
}
