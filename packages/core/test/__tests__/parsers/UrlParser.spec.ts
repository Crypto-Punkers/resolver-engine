import nock from "nock";
import { UrlParser } from "../../../src";

const incorrectUrls = [["", null], ["www.google.com", null]];
const correctUrls = [["http://example.com/some/file.txt", "http://example.com/some/file.txt"]];
const data = incorrectUrls.concat(correctUrls);

describe(UrlParser, () => {
  const parser = UrlParser();

  beforeAll(() => {
    nock.disableNetConnect();
    correctUrls.forEach(pair => {
      const [url, content] = pair;

      if (content) {
        nock(url)
          .get("")
          .reply(200, content)
          .persist();
      } else {
        nock(url)
          .get("")
          .reply(404, "")
          .persist();
      }
    });
  });

  it.each(data)("should parse %o into %o", async (input, expected) => {
    const output = await parser(input);
    expect(output).toBe(expected);
  });
});
