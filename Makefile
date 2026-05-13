.PHONY: dev hcl env
dev:
	./amper run --module jvm

hcl:
	cd data && kotlinc -script generate.main.kts && cd .. && cd server && bun run generate && bun fix

env:
	cp ./env/resources/env.example ./env/resources/app.env
