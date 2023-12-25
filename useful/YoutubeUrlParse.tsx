export default function YoutubeUrlParse(searchString: string) {
  if (!searchString) return

  let id = "";
  if (searchString.includes("youtube.com")) {
    id = searchString.split("v=")[1];
    if (id.includes("&")) {
      id = id.split("&")[0];
    }
  } else if (searchString.includes("youtu.be")) {
    id = searchString.split("/")[3];
  } else {
    id = searchString;
  }

  return id;
}
