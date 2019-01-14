import nock from "nock";
import { UriResolver } from "../../../src";

// input, output
const incorrectUrls = [["", null], ["www.google.com", null]];
const correctUrls = [["http://example.com/some/file.txt", "http://example.com/some/file.txt"]];
const data = incorrectUrls.concat(correctUrls);

describe(UriResolver, () => {
  const resolver = UriResolver(); // unintuitive af

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

  it.each(data)("should resolve %o to %o", async (input, expected) => {
    const output = await resolver(input);
    expect(output).toBe(expected);
  });
});
