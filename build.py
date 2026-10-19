#!/usr/bin/env python3
"""Baut die SJ Spielbank aus src/ zusammen.

  python3 build.py                -> index.html + version.txt (GitHub-Pages-Version mit Raum-Multiplayer)
  python3 build.py --artifact X   -> zusätzlich die Claude-Artifact-Version nach X
"""
import os, sys, time, glob

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
THREE = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
MQTT = ('<script src="https://unpkg.com/mqtt@5.10.1/dist/mqtt.min.js" onerror="var s=document.createElement(\'script\');'
        's.src=\'https://cdn.jsdelivr.net/npm/mqtt@5.10.1/dist/mqtt.min.js\';document.head.appendChild(s)"></script>')
NO3D = ('if(!window.THREE){const g=document.querySelector("#startGo");g.dataset.loading="false";g.style.animation="none";'
        'g.style.lineHeight="1.8";g.textContent="3D-GRAFIK KONNTE NICHT LADEN. ÖFFNE DAS SPIEL ÜBER DEN LINK MIT INTERNET.";return;}\n')

def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()

def game_js():
    js = '(function(){\n' + NO3D
    for p in sorted(glob.glob(os.path.join(SRC, '*.js'))):
        code = read(p)
        code = code.replace("if(typeof module!=='undefined')module.exports=SlotEngine;", '')
        code = code.replace("if(typeof module!=='undefined')module.exports=PokerCore;", '')
        js += '\n/* ---- ' + os.path.basename(p) + ' ---- */\n' + code + '\n'
    return js + '})();\n'

def main():
    shell = read(os.path.join(SRC, 'shell.html'))
    js = game_js()
    ver = str(int(time.time()))
    head = ('<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">\n'
            '<meta name="apple-mobile-web-app-capable" content="yes">\n')
    page = shell.replace(THREE, THREE + '\n' + MQTT + '\n<script>window.NK_STANDALONE=true;window.NK_VERSION="' + ver + '";</script>')
    page = page.replace('<title>', '<style>html,body{margin:0;height:100%;font-family:system-ui,sans-serif}'
                        ':root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}</style>\n<title>', 1)
    with open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(head + page + '<script>\n' + js + '</script>\n</body>\n</html>\n')
    with open(os.path.join(ROOT, 'version.txt'), 'w') as f:
        f.write(ver)
    if '--artifact' in sys.argv:
        out = sys.argv[sys.argv.index('--artifact') + 1]
        with open(out, 'w', encoding='utf-8') as f:
            f.write(shell + '<script>\n' + js + '</script>\n')
    print('gebaut, Version', ver)

if __name__ == '__main__':
    main()
