.PHONY: dev hcl env migrate
dev:
	./amper run --module jvm

hcl:
	cd data && kotlinc -script generate.main.kts && cd .. && cd server && bun run generate && bun fix

migrate:
	cd server && bun run migrate
	./amper build --module data

env:
	cp ./env/resources/env.example ./env/resources/app.env
