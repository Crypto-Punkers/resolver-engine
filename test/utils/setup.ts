import chai from "chai";
import chaiAsPromised from "chai-as-promised";

before("set-up chai", function() {
  chai.use(chaiAsPromised);
});
