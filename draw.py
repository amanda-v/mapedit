import os
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image

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

def plot(sx, sy, factor, z):
    global f
    if not ((sx, sy) in f.keys()):
         return
    data = np.ones((256, 256, 3), dtype=np.uint8)*20 
    filename = "data/"+str(z)+"/"+str(sx)+"/"+str(sy)+'.png'
   
    for (x,y) in f[(sx,sy)]:
        data[int(x / factor - sx * 256), int(y / factor - sy * 256), 0] = 255

    img = Image.fromarray(data)
    img.save(filename)


if not os.path.exists("data"):
    os.mkdir("data")

factor = 56*2*2 #one extra 2 for the initial div
for z in range(4,7):
    factor = int(factor / 2)
    f={}
    if not os.path.exists("data/"+str(z)):
        os.mkdir("data/"+str(z))
    for sx in range(16):
        for sy in range(14):
            f[(sx,sy)] = []
    
    for a in range(len(gx)):
        x = gx[a] - offsetx
        y = gy[a] - offsety
        f[(int(x/factor/256), int(y/factor/256))].append((x, y))
                
    for sx in range(16):
        for sy in range(14):
            if not os.path.exists("data/"+str(z)+"/"+str(sx)):
                os.mkdir("data/"+str(z)+"/"+str(sx))
            plot(sx, sy, factor, z)


