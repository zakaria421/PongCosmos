# Variables
DOCKER_COMPOSE_FILE=docker-compose.yml
GETHDATA_DIR = ./geth/gethdata

# PROJECT_NAME=my_project  # Replace with your Docker Compose project name

# Build and start services
up:
	docker compose up
build:
	docker compose up --build 

clean:
	docker system prune

stop:
	docker compose -f $(DOCKER_COMPOSE_FILE) down 

remove:
	rm -rf $(GETHDATA_DIR)/*

purify: remove clean

# Restart services
restart: clean remove build

# Remove only containers
remove-containers:
	docker rm -f $$(docker ps -aq)

# Remove only images
remove-images:
	docker rmi -f $$(docker images -q)

remove-net:
	docker network rm my-net

remove-volumes:
	docker volume rm $$(docker volume ls)

# Rebuild the services after cleaning containers and images
rebuild: remove remove-containers remove-images remove-net build


# View running containers
ps:
	docker compose -f $(DOCKER_COMPOSE_FILE) ps

# Tail logs from all services
logs:
	docker compose -f $(DOCKER_COMPOSE_FILE) logs -f

.PHONY: build clean restart remove-containers remove-images rebuild ps logs purify
