.PHONY: test
build:
	npx hardhat compile
test:
	npx hardhat test
deploy:
	npx hardhat ignition deploy ./ignition/modules/Lock.ts