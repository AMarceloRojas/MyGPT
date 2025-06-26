import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm"

const loader = document.getElementById('loader-container')
const main = document.querySelector('main')
const form = document.querySelector('form')
const progressBar = document.getElementById('progress-bar')
const loadingText = document.querySelector('.loading-text')

const $ = el => document.querySelector(el)

const $form = $('form')
const $input = $('input')
const $template = $('#message-template')
const $messages = $('ul')
const $container = $('main')
const $button = $('button')
const $info = $('small')

let messages = []

const SELECTED_MODEL = 'Llama-3.2-1B-Instruct-q4f16_1-MLC'


let dots = ''
const textInterval = setInterval(() => {
  loadingText.textContent = 'Cargando modelo' + dots
  dots = dots.length < 3 ? dots + '.' : ''
}, 500)


let fakeProgress = 0
const progressInterval = setInterval(() => {
  if (fakeProgress < 95) {
    fakeProgress += Math.random() * 2
    progressBar.style.width = `${fakeProgress}%`
  }
}, 100)

const engine = await CreateMLCEngine(
  SELECTED_MODEL,
  {
    initProgressCallback: (info) => {
      $info.textContent = `${info.text}%`

      
      if (info.progress === 1) {
        clearInterval(textInterval)
        clearInterval(progressInterval)

        loadingText.textContent = '¡Carga completada!'
        progressBar.style.width = '100%'

        setTimeout(() => {
          loader.style.display = 'none'
          main.style.display = 'block'
          form.style.display = 'flex'
          $button.removeAttribute('disabled')
        }, 600)
      }
    }
  }
)

$form.addEventListener('submit', async (event) => {
  event.preventDefault()
  const messageText = $input.value.trim()

  if (messageText !== '') {
    $input.value = ''
  }

  addMessage(messageText, 'user')
  $button.setAttribute('disabled', '')

  const userMessage = {
    role: 'user',
    content: messageText
  }

  messages.push(userMessage)

  const chunks = await engine.chat.completions.create({
    messages,
    stream: true
  })

  let reply = ""
  const $botMessage = addMessage("", 'bot')
  for await (const chunk of chunks) {
    const choice = chunk.choices[0]
    const content = choice?.delta?.content ?? ""
    reply += content
    $botMessage.textContent = reply
  }

  $button.removeAttribute('disabled')
  messages.push({
    role: 'assistant',
    content: reply
  })
  $container.scrollTop = $container.scrollHeight
})

function addMessage(text, sender) {
  const clonedTemplate = $template.content.cloneNode(true)
  const $newMessage = clonedTemplate.querySelector('.message')

  const $who = $newMessage.querySelector('span')
  const $text = $newMessage.querySelector('p')

  $text.textContent = text
  $who.classList.add('avatar')
  if (sender !== 'bot') $who.textContent = 'tu'

  $newMessage.classList.add(sender === 'bot' ? 'MyGpt' : 'user')
  $messages.appendChild($newMessage)
  $container.scrollTop = $container.scrollHeight

  return $text
}