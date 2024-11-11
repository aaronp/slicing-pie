.PHONY: test cli dapp
build:
	npx hardhat compile
test: build
	REPORT_GAS=true npx hardhat test
test-fast: build
	npx hardhat test --parallel
coverage: test
	npx hardhat coverage
deploy: test
	npx hardhat ignition deploy ./ignition/modules/GruntFund.module.ts --network localhost
# will run a network at http://127.0.0.1:8545
start-network:
	npx hardhat node
# see https://hardhat.org/hardhat-runner/docs/guides/hardhat-console
console:
	npx hardhat console --network localhost
cli:
	pushd cli && make && popd
dapp:
	pushd dapp && make && popd