.PHONY: build preview
run:
	npm i && npm run dev
build:	
	npm run build
preview: build
	npm run preview
docker:
	docker build . -t kindservices/grunt-fund:0.0.1