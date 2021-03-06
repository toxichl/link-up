import Block from '../dom/Block'
import {getColor} from '../utils/utils'

export default class LinkupElement extends Block {

    constructor(typeValue) {

        super()

        // default style
        this.setFloat()
            .setBgColor(typeValue ? getColor() : 'rgb(235,237,240)')
            .setAttr('el-type', typeValue)
            .setWidthAndHeight(35, 35)
            .addClass('martix-element')

    }

}