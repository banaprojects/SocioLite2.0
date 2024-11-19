import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { NextApiRequest, NextApiResponse } from 'next';
import SocketHandler from '@/lib/socket-server';
import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';

type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: HttpServer & {
      io?: IOServer;
    };
  };
};

export async function GET(req: NextRequest) {
  try {
    const res = {
      socket: {
        server: new HttpServer()
      },
      end: () => {},
      writeHead: () => {}
    } as unknown as NextApiResponseWithSocket;
    
    await SocketHandler((req as unknown) as NextApiRequest, res);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Socket initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize socket connection' },
      { status: 500 }
    );
  }
} 