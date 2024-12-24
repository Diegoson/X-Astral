FROM quay.io/sampandey001/secktor
RUN git clone https://github.com/Diegoson/X-Astral /root/Diegoson
WORKDIR /root/Diegoson/
RUN npm install npm@latest
RUN npm install
EXPOSE 8000
CMD ["npm", "start"]
