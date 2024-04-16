export default class UtilElement {
    #element: Element
    #children = new Array<UtilElement>()

    constructor(el: Element)
    constructor(selector: string) 
    constructor(el: Element | string) {
        try {
            this.#element = 
                el instanceof Element
                    ? el
                    : document.createElement(el)

        } catch (error) {
            throw new Error('Error: ' + error)
        }
    }

    html(html: string) {
        this.#element.innerHTML = html
        return this
    }

    class(...classNames: string[]) {
        this.#element.classList.add(...classNames)
        return this
    }

    append(...elements: Array<Element | UtilElement>) {
        elements.forEach(el => {
            this.#element.appendChild(
                el instanceof Element
                    ? el
                    : el.#element
            )

            this.#children.push(
                el instanceof Element
                    ? new UtilElement(el)
                    : el
            )
        })

        return this
    }

    parent(el: HTMLElement | UtilElement) {
        el.append(this.#element)
        return this
    }

    prop(key: string, value: string) {
        this.#element.setAttribute(key, value)
        return this
    }

    on(event: string, handler: (e: Event) => void) {
        this.#element.addEventListener(event, handler)
        return this
    }

    get(key: 'html' | 'class' | 'id' | 'prop', value?: string) {
        switch (key) {
            case 'html':
                return this.#element.innerHTML
            
            case 'class':
                return this.#element.classList

            case 'id':
                return this.#element.id

            case 'prop':
                if (!value) return null
                return this.#element.getAttribute(value)
        }
    }

    get element() {
        return this.#element
    }
}