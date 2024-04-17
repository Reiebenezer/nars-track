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
        classNames.forEach(c => {
            if (!c) return
            this.#element.classList.add(c)
        })
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

    prepend(...elements: Array<Element | UtilElement>) { 
        this.#element.prepend(...elements.map(el => el instanceof Element ? el : el.#element))
        this.#children.unshift(...elements.map(el => el instanceof Element ? new UtilElement(el) : el))

        return this
    }

    parent(el: HTMLElement | UtilElement) {
        el.append(this.#element)
        return this
    }

    prop(key: string, value?: string) {
        this.#element.setAttribute(key, value ?? '')
        return this
    }

    toggleProp(key: string, condition?: boolean) {
        this.#element.toggleAttribute(key, condition)
        return this
    }

    on(event: string, handler: (e: Event) => void) {
        this.#element.addEventListener(event, handler)
        return this
    }

    remove() {
        this.#element.remove()
        return this
    }

    get(key: 'html' | 'class' | 'id' | 'prop' | 'tag', value?: string) {
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

            case 'tag':
                return this.#element.tagName.toLowerCase()
        }
    }

    getChild(matchingFunction: (el: UtilElement) => boolean) {
        return this.#children.find(matchingFunction)
    }

    get element() {
        return this.#element
    }
}