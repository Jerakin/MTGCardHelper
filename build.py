from pathlib import Path
import shutil
import os
import subprocess
import xml.etree.ElementTree as ET

import click
from dotenv import load_dotenv
from css_html_js_minify import process_single_js_file, process_single_css_file, process_single_html_file

NAME = "MTGCardHelper"
root_path = Path(__file__).parent
app_path = root_path / "app"
build_path = root_path / "build" / NAME
dist_path = root_path / "dist"

load_dotenv()

exclude = [".env", ".DS_Store", "_MACOSX", "META-INF"]


def setup():
    if build_path.exists():
        shutil.rmtree(build_path)

    dist_path.parent.mkdir(exist_ok=True)
    build_path.mkdir(parents=True, exist_ok=True)


def copy_assets():
    for file in app_path.glob("**/*.*"):
        skip = [x for x in exclude if x in file.as_posix()]
        if skip:
            continue
        if file.is_file():
            new_path = build_path / file.relative_to(app_path)
            new_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(file, new_path)


def minify_build():
    for file in build_path.glob("**/*.*"):
        if file.suffix in [".js", ".jsx"]:
            process_single_js_file(file.as_posix(), overwrite=True)
        elif file.suffix in ".css" and ".min." not in file.name:
            process_single_css_file(file.as_posix(), overwrite=True)
        elif file.suffix in [".html"]:
            process_single_html_file(file.as_posix(), overwrite=True)


def build_app(v):
    build_ = dist_path / f"{NAME}-{v}.zxp"
    if build_.exists():
        build_.unlink()
    cmd = [os.getenv('ZXPSIGNCMD'), "-sign", build_path.as_posix(), build_.as_posix(),
           os.getenv('CERTIFICATE'), os.getenv('PASSWORD'),  "-tsa", "http://time.certum.pl/"]

    subprocess.run(cmd)


def verify_app(v):
    cmd = [os.getenv('ZXPSIGNCMD'), "-verify", dist_path / f"{NAME}-{v}.zxp",
           "-certinfo"]

    subprocess.run(cmd)


def update_version(v):
    source = build_path / "CSXS" / "manifest.xml"

    tree = ET.parse(source.as_posix())
    xml_root = tree.getroot()
    xml_root.set("ExtensionBundleVersion", v)

    ext_list = xml_root.find("ExtensionList")
    for ext in ext_list.iter("Extension"):
        ext.set("Version", v)
    tree.write(source.as_posix())


def set_release():
    app, panel, name = "com.jerakin.mtgcardhelper", "com.jerakin.mtgcardhelper.panel", "MTG Card Helper"

    source = build_path / "CSXS" / "manifest.xml"

    tree = ET.parse(source.as_posix())
    xml_root = tree.getroot()
    xml_root.set("ExtensionBundleId", app)
    xml_root.set("ExtensionBundleName", name)

    ext_list = xml_root.find("ExtensionList")
    for ext in ext_list.iter("Extension"):
        ext.set("Id", panel)

    ext_list = xml_root.find("DispatchInfoList")
    for ext in ext_list.iter("Extension"):
        ext.set("Id", panel)
        for inf in ext.iter("DispatchInfo"):
            for ui in inf.iter("UI"):
                for menu in ui.iter("Menu"):
                    menu.text = name

    tree.write(source.as_posix())


@click.command()
@click.option("--debug", default=False)
@click.option("--no-verify", default=False)
def build(debug, no_verify):
    if not debug:
        exclude.append(".debug")

    app_version = (root_path / "VERSION").read_text().strip()
    setup()
    copy_assets()
    update_version(app_version)
    if not debug:
        set_release()
    build_app(app_version)
    if not no_verify:
        verify_app(app_version)


if __name__ == '__main__':
    build()
