# based off of template from https://github.com/docker/awesome-compose/blob/master/flask/app/Dockerfile
# Create image based on the official Node image from dockerhub
FROM python:3.11.8-bookworm

WORKDIR /app

COPY requirements.txt /app
RUN --mount=type=cache,target=/root/.cache/pip \
    pip3 install -r requirements.txt

COPY . /app

ENTRYPOINT ["python3"]
CMD ["py", "app.py"]