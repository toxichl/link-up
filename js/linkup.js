/**
 * linkup.js
 * toxichl @ 2016 - 2017
 * MIT LiCENSE
 */

/**
 * Target
 */

class Target {

    constructor(targetElement) {

        if (!(targetElement instanceof HTMLElement)) {
            throw new Error('[Error] unExpected parameters' + targetElement)
        }

        this.element = targetElement
    }

    choose() {
        dom.addClass(this.element, 'choosed')
    }

    unChoose() {

        dom.removeClass(this.element, 'choosed')
    }

    remove() {
        dom.setBgColor(this.element, 'rgb(235,237,240)')
        dom.removeClass(this.element, 'choosed')
        dom.setAttr(this.element, 'el-type', '0')
    }

    get type() {
        return this.element.getAttribute('el-type')
    }

    get isChoosed() {
        return dom.hasClass(this.element, 'choosed')
    }

    get key() {
        return this.element.getAttribute('matrix-key')
    }

    get bgColor() {
        return this.element.style.backgroundColor
    }

}

/**
 * Target Collection
 */
class TargetCollection {

    constructor(targetCollection) {

        if (targetCollection) {

            if (!Array.isArray(targetCollection)) {
                throw new Error('[Error] unExpected parameters' + targetCollection)
            }

            for (let target of targetCollection) {
                if (!(target instanceof Target)) {
                    throw new Error('[Error] unExpected parameters' + targetCollection)
                }
            }

        }

        this.collection = targetCollection || []
    }

    push(target) {
        this.collection.push(target)
    }

    deleteFirst() {
        return this.collection.pop()
    }

    empty() {
        this.collection = []
    }

    delete(target) {
        this.collection.splice(
            find(this.collection, target), 1
        )
    }

    get colorCheck() {
        return this.pointOneBgColor === this.pointTwoBgColor
    }

    get length() {
        return this.collection.length
    }

    get isFull() {
        return this.length === 2
    }

    // get coordinate 1
    get pointOne() {
        return this.collection[0].key.split('-')
    }

    // get coordinate 2
    get pointTwo() {
        return this.collection[1].key.split('-')
    }

    get pointOneBgColor() {
        return this.collection[0].bgColor
    }

    get pointTwoBgColor() {
        return this.collection[1].bgColor
    }

}

class Matrix {

    constructor(xAxis, yXias, zeroChance) {
        this.data = Matrix.createMatrix(xAxis, yXias, zeroChance)
        this.choices = new TargetCollection()
    }

    getDom() {

        return Matrix.createDomByMatrix(this.data, target => this.handle(target))
    }

    // handle the click target element
    handle(target) {

        target = new Target(target)

        if (target.type == 0) {
            console.log('Cannot choose!')
            return
        }

        if (target.isChoosed) {
            target.unChoose()
            this.choices.delete(target)

        } else {
            this.linkHandle(target)
        }
    }

    // handle the link of the target
    linkHandle(target) {

        console.log(this.choices)

        if (this.choices.isFull) {
            let firstTarget = this.choices.deleteFirst()
            firstTarget.unChoose()
        }

        target.choose()
        this.choices.push(target)

        if (this.choices.isFull) {

            // check color
            if (!this.choices.colorCheck) {
                console.info('Cannot match color!')
                return
            }

            // check link
            let linkCheck = Matrix.linkCheck(
                this.data,
                this.choices.pointOne,
                this.choices.pointTwo
            )

            if (linkCheck) this.successLink()

        }
    }

    // if link success ...
    successLink() {

        for (let target of this.choices.collection) {
            let pos = target.key.split('-')
            this.data[pos[0]][pos[1]] = 0
            target.remove()
        }

        this.choices.empty()
    }

    /**
     * 根据随机矩阵生成对应的DOM
     * @param {Array} matrix - 矩阵
     * @param {Function} callback - 点击某个元素的回调，会返回其坐标
     * @returns {*}
     */
    static createDomByMatrix(matrix, callback) {

        let container = dom.createDiv()

        matrix.forEach((line, i)=> {

            let subContainer = dom.createDiv()
            dom.addClass(subContainer, 'clearfix')

            line.forEach((element, j) => {

                let el = Matrix.createMatrixElement(element)

                dom.setAttr(el, 'matrix-key', `${i}-${j}`)
                    .addEvent(el, 'click', e => {
                        callback && callback(
                            e.target
                        )
                    })

                subContainer.appendChild(el)

            })

            container.appendChild(subContainer)

        })

        return container

    }

    /**
     * 生成一个随机矩阵
     * @param {Number} xAxis
     * @param {Number} yXias
     * @param {Number} zeroChance - 0出现的概率(默认生成0和1的概率相等)
     * @returns {Array}
     */
    static createMatrix(xAxis, yXias, zeroChance) {

        if (!zeroChance) {
            zeroChance = 0.5
        }

        let matrix = new Array()

        for (let i = 0; i < xAxis; i++) {

            matrix[i] = new Array()

            for (let j = 0; j < yXias; j++) {
                matrix[i].push(
                    Math.random() >= zeroChance + 0.1 ? 1 : 0
                )
            }

        }

        return matrix
    }

    /**
     * 生成
     * @param value
     * @returns {*}
     */
    static createMatrixElement(value) {

        let el = dom.createDiv()

        // 设定默认样式
        dom.setFloat(el)
            .setBgColor(el, value ? getColor() : 'rgb(235,237,240)')
            .setAttr(el, 'el-type', value)
            .setWidthAndHeight(el, 50, 50)
            .addClass(el, 'martix-element')

        return el
    }


    static linkCheck(matrix, point1, point2) {

        let aCheck = Array.isArray
        if (!aCheck(matrix) || !aCheck(point1) || !aCheck(point2)) {
            throw new Error('[Error 01] Unexpected parameters')
        }

        let x1 = point1[0], y1 = point1[1]
        let x2 = point2[0], y2 = point2[1]

        let xmin = Math.min(x1, x2), xmax = Math.max(x1, x2)
        let ymin = Math.min(y1, y2), ymax = Math.max(y1, y2)

        let left = new Set()
        let right = new Set()

        for (let i = xmin; i <= xmax; i++) {
            left.add([i, y1])
            right.add([i, y2])
        }

        for (let j = ymin; j <= ymax; j++) {
            left.add([x2, j])
            right.add([x1, j])
        }

        function check(set) {
            for (let item of set.values()) {
                let itemStr = item.join()
                if (itemStr !== point1.join() && itemStr !== point2.join()) {
                    if (matrix[item[0]][item[1]] === 1) {
                        return false
                    }
                }
            }
            return true
        }

        if (check(left)) {
            return true

        } else if (check(right)) {
            return true

        } else {
            return false
        }

    }

}