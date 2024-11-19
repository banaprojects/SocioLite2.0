import { Server as NetServer } from 'http'
import { NextApiRequest } from 'next'
import { Server as ServerIO } from 'socket.io'
import { NextApiResponseWithSocket } from './socket'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function SocketHandler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as unknown as NetServer
    const io = new ServerIO(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
    })
    
    res.socket.server.io = io

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      socket.on('join-event', (eventId: string) => {
        socket.join(eventId)
        console.log(`Socket ${socket.id} joined event: ${eventId}`)
      })

      socket.on('new-message', (message) => {
        console.log('New message:', message)
        // Broadcast to all clients in the room INCLUDING the sender
        io.to(message.eventId).emit('message-received', message)
      })

      socket.on('event-renamed', (data) => {
        io.to(data.eventId).emit('event-rename-notification', {
          eventId: data.eventId,
          oldTitle: data.oldTitle,
          newTitle: data.newTitle,
        })
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })
  }
  res.end()
} 