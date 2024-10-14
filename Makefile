.PHONY: test
build:
	npx hardhat compile
test:
	npx hardhat test
deploy:
	npx hardhat ignition deploy ./ignition/modules/Lock.ts
# will run a network at http://127.0.0.1:8545
start-network:
	npx hardhat node