import { Server } from 'socket.io';
import { NextApiResponse } from 'next';
import { Server as NetServer } from 'http';

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: Server;
    };
  };
};

export const initSocket = (res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join-event', (eventId: string) => {
        socket.join(eventId);
        console.log(`Socket ${socket.id} joined event: ${eventId}`);
      });

      socket.on('leave-event', (eventId: string) => {
        socket.leave(eventId);
        console.log(`Socket ${socket.id} left event: ${eventId}`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }
  return res.socket.server.io;
}; 