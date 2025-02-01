import cv2
from ultralytics import YOLO
from moviepy import *
import os
import sys


model = YOLO("yolo11m_custom2.pt")
# Open video file
video_path = "uploads/test.mp4"  # Replace with your video path
cap = cv2.VideoCapture(video_path)

# Get frames per second (fps) of the video
print("Fps:",cap.get(cv2.CAP_PROP_FPS))
cap.set(cv2.CAP_PROP_FPS, 60)
fps = int(cap.get(cv2.CAP_PROP_FPS))  


# Check if video opened successfully
if not cap.isOpened():
    print("Error: Could not open video.")
    exit()

i = 0
j = 0
saved_count = 0
list = []
while True:
    ret, frame = cap.read()
    
    if not ret:
        break  # Break loop if no frame is read (end of video)

    # Save only one frame per second
    if i % fps == 0:  
        print(i,"\n")
        print("Status",i/cap.get(cv2.CAP_PROP_FRAME_COUNT)*100,"%")
        # Resize frame to 500x500
        frame = cv2.resize(frame, (416,416))

       
        # cv2.imwrite("img11.png", frame)
        # time.sleep(1)
        result = model(frame, conf=0.7, verbose=False)
        
        # print(result[0].boxes)
        # break
        box = result[0].boxes.cls.tolist()
        # Print results
        # print(box)

        if(len(box)==2):
            list.append(int(j))
        elif(len(box)==1 and box[0]==1.0):
            list.append(int(j))
        j += 1
       
        

    i += 1  # Increment total frame count

# Release video
cap.release()
#======================================================================================
#Code for making timestamps
def solve(test):
    ans = []
    
    for i in range(len(test)):
        if i == 0:
            temp = [max(0, test[i] - 6), test[i]]
            ans.append(temp)
        else:
            a = max(0, test[i] - 6)
            b = test[i]
            
            # Merge intervals if overlapping
            if a <= ans[-1][1]:
                ans[-1][1] = b
            else:
                ans.append([a, b])
    
    return ans




clips =[]
#path = "D:\hackthon\Valorant Gameplay.mp4"
    
if len(list) == 0:
    print("There is no kills in this game")
else:
    ans = solve(list)
    k = 0
    for interval in ans:
        clips.append(VideoFileClip(video_path).subclipped(interval[0],interval[1]))
        print(interval[0], interval[1])

#========================================================
# print(list)


# from moviepy import *

# clip1 = VideoFileClip(path).subclipped(90,110)
# clip2 = VideoFileClip(path).subclipped(325,355)
# clip3 = VideoFileClip(path).subclipped(400,420)
# clip4 = VideoFileClip(path).subclipped(1385,1395)
# clip5 = VideoFileClip(path).subclipped(1580,1588)

video = concatenate_videoclips(clips)
# video.write_videofile("final/output.mp4")
# from moviepy import *
# from moviepy.audio.fx.all import volumex 


# video_path = "final/temp.mp4"

audio_path = ""


if(sys.argv[1]=="1"):
    audio_path = "uploads/audio.mp3"
    print(audio_path)
    original_audio = video.audio
    video_time=video.duration

    audio=AudioFileClip(audio_path)
    audio1=audio

    while(audio.duration-25 < video_time):
        audio=audio1+audio


    music = audio.subclipped(25, 25+video_time)

    music = music.with_effects([afx.MultiplyVolume(0.3)])



    final_audio = CompositeAudioClip([original_audio, music])
    video = video.with_audio(final_audio)
    print("Audio file found===================================================================================================================")




video.write_videofile("final/output.mp4", codec="libx264", audio_codec="aac")






# original_audio = video.audio
# video_time=video.duration

# music = AudioFileClip(audio_path).subclipped(25, 25+video_time)

# music = music.with_effects([afx.MultiplyVolume(0.3)])
 


# final_audio = CompositeAudioClip([original_audio, music])
# video = video.with_audio(final_audio)

#video.write_videofile("final/output.mp4", codec="libx264", audio_codec="aac")

