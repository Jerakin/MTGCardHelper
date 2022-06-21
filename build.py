from pathlib import Path
from dotenv import load_dotenv
import shutil
import os
import subprocess
import re

NAME = "MTGCardHelper"
root = Path(__file__).parent
app = root / "app"
build = root / "build" / NAME
dist = root / "dist"

load_dotenv()

exclude = [".debug", ".env", ".DS_Store", "_MACOSX", "META-INF"]


def setup():
    if build.exists():
        shutil.rmtree(build)

    dist.parent.mkdir(exist_ok=True)
    build.mkdir(parents=True, exist_ok=True)


def copy_assets():
    for file in app.glob("**/*.*"):
        skip = [x for x in exclude if x in file.as_posix()]
        if skip:
            continue
        if file.is_file():
            new_path = build / file.relative_to(app)
            new_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(file, new_path)


def build_app(v):
    cmd = [os.getenv('ZXPSIGNCMD'), "-sign", build.as_posix(), dist / f"{NAME}-{v}.zxp",
           os.getenv('CERTIFICATE'), os.getenv('PASSWORD'),  "-tsa", "http://time.certum.pl/"]

    subprocess.run(cmd)


def update_version(v):
    re_manifest_v = re.compile('Version="(.*)"')

    new_manifest_v = f'Version="{v}"'
    source = build / "CSXS" / "manifest.xml"
    with source.open("r") as fp:
        file_content = fp.read()

    file_content = re.sub(re_manifest_v, new_manifest_v, file_content)

    with source.open("w") as fp:
        fp.write(file_content)


app_version = (root / "VERSION").read_text().strip()
setup()
copy_assets()
update_version(app_version)
build_app(app_version)
