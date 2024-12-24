FROM quay.io/vorterx/vorterx:latest
RUN git clone https://github.com/Diegoson/X-Astral /root/vorterx
WORKDIR /root/vorterx/
RUN npm install
EXPOSE 8000
CMD ["npm", "start"]
