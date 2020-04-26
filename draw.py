import os
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image, ImageDraw

f = {} 

gx=[] 
gy=[]
lines = open("hello","r").readlines()
for line in lines:
    [x,y]=line.split()
    x = float(x)
    y = float(y)
    gx.append(x)
    gy.append(y)

print(min(gx), min(gy))
print(max(gx), max(gy))
offsetx = -49000
offsety = -45000

def plot(f, sx, sy, factor, z):
    if not ((sx, sy) in f.keys()):
         return
    data = np.ones((256, 256, 3), dtype=np.uint8)*20 
    filename = "data/"+str(z)+"/"+str(sx)+"/"+str(sy)+'.png'
   
    for (x,y) in f[(sx,sy)]:
        data[int(255 - y), int(x), 0] = 255

    img = Image.fromarray(data)
    draw = ImageDraw.Draw(img)
    draw.text((5, 5), str((sx, sy)), align ="left")

    img.save(filename)


if not os.path.exists("data"):
    os.mkdir("data")

factor = 56*2*2 #one extra 2 for the initial div
for z in range(4,8):
    factor = int(factor / 2)
    fa = factor * 256
    f={}
    if not os.path.exists("data/"+str(z)):
        os.mkdir("data/"+str(z))
    for sx in range(32):
        for sy in range(28):
            f[(sx,sy)] = []
    
    for a in range(len(gx)):
        x = gx[a] - offsetx
        y = gy[a] - offsety
        ox = int((x % fa) / factor) 
        oy = int((y % fa) / factor)
        f[(int(x/fa), int(y/fa))].append((ox, oy))
                
    for sx in range(32):
        for sy in range(28):
            if not os.path.exists("data/"+str(z)+"/"+str(sx)):
                os.mkdir("data/"+str(z)+"/"+str(sx))
            plot(f, sx, sy, factor, z)


