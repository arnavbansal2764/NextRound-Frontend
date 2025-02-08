export type RequestMessage = StartDiscussionRequest | HumanMessageRequest | EndDiscussionRequest

export interface StartDiscussionRequest {
    type: "START_DISCUSSION"
    topic: string
}

export interface HumanMessageRequest {
    type: "HUMAN_MESSAGE"
    message: string
}

export interface EndDiscussionRequest {
    type: "END_DISCUSSION"
}

export type ResponseMessage = GDStartResponse | GDHumanAddedResponse | GDBotResponsesResponse | GDEndResponse

export interface GDStartResponse {
    type: "GD_START"
    payload: string
}

export interface GDHumanAddedResponse {
    type: "GD_HUMAN_ADDED"
    payload: string
}

export interface GDBotResponsesResponse {
    type: "GD_BOT_RESPONSES"
    payload: string
}

export interface GDEndResponse {
    type: "GD_END"
    payload: string
}

type MessageHandler = (msg: ResponseMessage) => void

export class GroupDiscussionClient {
    private socket!: WebSocket
    private messageHandlers: MessageHandler[] = []

    constructor(private url = "wss://ws2.nextround.tech/ws/group-discussion") { }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.socket = new WebSocket(this.url)

            this.socket.onopen = () => {
                console.info("Connected to Group Discussion server")
                resolve()
            }

            this.socket.onerror = (e) => {
                console.error("WebSocket error:", e)
                reject(e)
            }

            this.socket.onmessage = (event: MessageEvent) => {
                try {
                    const data: ResponseMessage = JSON.parse(event.data)
                    this.handleMessage(data)
                } catch (err) {
                    console.error("Error parsing message:", err)
                }
            }

            this.socket.onclose = () => {
                console.info("WebSocket connection closed")
            }
        })
    }

    private handleMessage(msg: ResponseMessage) {
        this.messageHandlers.forEach((handler) => handler(msg))
    }

    onMessage(handler: MessageHandler) {
        this.messageHandlers.push(handler)
    }

    sendMessage(message: RequestMessage) {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message))
        } else {
            console.error("WebSocket is not open. ReadyState:", this.socket.readyState)
        }
    }

    startDiscussion(topic: string) {
        const msg: StartDiscussionRequest = {
            type: "START_DISCUSSION",
            topic,
        }
        this.sendMessage(msg)
    }

    sendHumanMessage(message: string) {
        const msg: HumanMessageRequest = {
            type: "HUMAN_MESSAGE",
            message,
        }
        this.sendMessage(msg)
    }

    endDiscussion() {
        const msg: EndDiscussionRequest = {
            type: "END_DISCUSSION",
        }
        this.sendMessage(msg)
    }

    disconnect() {
        if (this.socket) {
            this.socket.close()
        } else {
            console.warn("Socket is not initialized.")
        }
    }
}

