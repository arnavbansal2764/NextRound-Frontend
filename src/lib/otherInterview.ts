export class InterviewSocketClient {
    private socket: WebSocket | null = null

    constructor(private serverUrl: string) { }

    public connect(path: string, numberOfQues: number, difficulty: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.socket = new WebSocket(this.serverUrl)
            this.socket.onopen = () => {
                const initMsg = {
                    action: "initial_setup",
                    path: path,
                    number_of_ques: numberOfQues,
                    difficulty: difficulty,
                }
                this.socket?.send(JSON.stringify(initMsg))
            }
            this.socket.onerror = (err) => reject(err)
            this.socket.onmessage = (evt) => {
                const data = JSON.parse(evt.data)
                if (data.action === "initial_setup" && data.status === "ok") {
                    resolve()
                }
            }
        })
    }

    public getQuestion(): Promise<{ question: string }> {
        return new Promise((resolve, reject) => {
            if (!this.socket) return reject("Socket not connected.")
            this.socket.send(JSON.stringify({ action: "get_question" }))
            this.socket.onmessage = (evt) => {
                const data = JSON.parse(evt.data)
                if (data.action === "get_question" && data.status === "ok") resolve({ question: data.question })
            }
        })
    }

    public addQuestionAnswer(question: string, answerText: string, code : string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.socket) return reject("Socket not connected.")
            this.socket.send(
                JSON.stringify({
                    action: "add_ques_ans",
                    question: question,
                    answer_text: answerText,
                    code: code,
                }),
            )
            this.socket.onmessage = (evt) => {
                const data = JSON.parse(evt.data)
                if (data.action === "add_ques_ans") {
                    data.status === "ok" ? resolve() : reject(data.message)
                }
            }
        })
    }

    public analyze(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.socket) return reject("Socket not connected.")
            this.socket.send(JSON.stringify({ action: "analyze" }))
            this.socket.onmessage = (evt) => {
                const data = JSON.parse(evt.data)
                if (data.action === "analyze") {
                    data.status === "ok" ? resolve(data) : reject(data.message)
                }
            }
        })
    }

    public stopInterview(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.socket) return reject("Socket not connected.")
            this.socket.send(JSON.stringify({ action: "stop_interview" }))
            this.socket.onmessage = (evt) => {
                const data = JSON.parse(evt.data)
                if (data.action === "stop_interview") {
                    data.status === "ok" ? resolve() : reject(data.message)
                }
            }
        })
    }

    public close(): void {
        this.socket?.close()
        this.socket = null
    }
}

