.PHONY: dev hcl
dev:
	./amper run --module jvm

hcl:
	cd data && kotlinc -script generate.main.kts && cd .. && cd server && bun run generate && bun fix