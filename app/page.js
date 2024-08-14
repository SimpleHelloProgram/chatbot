'use client'
import { Box, Button, Stack, TextField } from '@mui/material'
import { useState, useEffect, useRef } from "react";

export default function Home() {
    const [messages, setMessages] = useState([{
      role: 'assistant',
      content: 'Hi Im the J.A.R.V.I.S, how can I assist you today'
    }]) 

    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const sendMessage = async () => {
      if (!message.trim()) return;  // Don't send empty messages
      setIsLoading(true)
    
      setMessage('')
      setMessages((messages) => [
        ...messages,
        { role: 'user', content: message },
        { role: 'assistant', content: '' },
      ])
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([...messages, { role: 'user', content: message }]),
        })
    
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
    
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
    
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const text = decoder.decode(value, { stream: true })
          setMessages((messages) => {
            let lastMessage = messages[messages.length - 1]
            let otherMessages = messages.slice(0, messages.length - 1)
            return [
              ...otherMessages,
              { ...lastMessage, content: lastMessage.content + text },
            ]
          })
        }
      } catch (error) {
        console.error('Error:', error)
        setMessages((messages) => [
          ...messages,
          { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
        ])
      }
      setIsLoading(false)
    }
    const handleKeyPress = (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        sendMessage()
      }
    }

    const messagesEndRef = useRef(null)
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
      scrollToBottom()
    }, [messages])

 
        return (
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        // bgcolor={'#b49577'}
        
      >
        <Stack
          direction={'column'}
          width="500px"
          height="700px"
          border="1px solid black"
          p={2}
          spacing={3}
          bgcolor={'#1c1c2e'}
          sx={{
            borderRadius: '30px', // Set the desired border-radius value
          }}
        >
          <Stack
            direction={'column'}
            spacing={2}
            flexGrow={1}
            overflow="auto"
            maxHeight="100%"
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={
                  message.role === 'assistant' ? 'flex-start' : 'flex-end'
                }
              >
                <Box
                  bgcolor={
                    message.role === 'assistant'
                      ? '#2e3b4e'
                      : '#00bcd4'
                  }
                  color="white"
                  borderRadius={16}
                  p={3}
                >
                  {message.content}
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
          <Stack direction={'row'} spacing={2}>
            <TextField
              label="Message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'cyan', // Default border color
                  },
                  '&:hover fieldset': {
                    borderColor: 'cyan', // Border color when hovered
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'cyan', // Border color when focused
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'lightgrey', // Label color
                },
                '& .MuiInputBase-input': {
                  color: 'white', // Text color inside the input
                },
              }}
            />
            <Button 
            variant="contained" 
            onClick={sendMessage} 
            color = "inherit" 
            disabled={isLoading}
              sx={{
                backgroundColor: 'lightblue', // Default background color
                color: 'black', // Default text color
                '&:hover': {
                  backgroundColor: '#00bcd4', // Background color on hover
                },
              }}>
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    )
}
