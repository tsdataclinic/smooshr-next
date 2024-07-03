# Smooshr 2.0

**This repo is still a work in progress and not ready for public collaboration.**

Smooshr 2.0 (new name TBD) is a no-code data pipeline builder and runner that allows users to configure a repeatable set of steps to process, clean up, and validate data.

## Local set up

1. Clone this repo
2. Install JavaScript dependencies with `yarn install`
3. Create your python virtual environment: `python -m venv venv`
4. Start your virtual environment: `source venv/bin/activate`
5. Install pip-tools: `pip install pip-tools`
6. Install python dependencies: `pip-compile requirements.in`

**NOTE:** Python dependencies are managed in the `requirements.in` file. Think of `requirements.in` as your `package.json` equivalent. When you want to add a new Python library, add it to `requirements.in` and then run `pip-compile requirements.in`. This will install all necessary libraries and update `requirements.txt` with the correct versions. This is better than using `pip install some-library` directly, which does not auto-update the `requirements.txt` file.

Now you are ready to run the app. You will need two separate tabs, one for the frontend and another for the API server.

1. In one tab, start the frontend with `yarn dev`
2. In the other tab, start the server with `yarn api`
