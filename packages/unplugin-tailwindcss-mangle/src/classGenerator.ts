// import chalk from 'chalk'
import type { IMangleOptions, IMangleContextClass, IClassGenerator } from './types'

import { acceptChars, stripEscapeSequence, regExpTest } from './utils'

class ClassGenerator implements IClassGenerator {
  public newClassMap: Record<string, IMangleContextClass>
  public newClassSize: number
  public context: Record<string, any>
  public opts: IMangleOptions
  public classPrefix: string
  constructor(opts: IMangleOptions = {}) {
    this.newClassMap = {}
    this.newClassSize = 0
    this.context = {}
    this.opts = opts
    this.classPrefix = opts.classPrefix ?? 'tw-'
  }

  defaultClassGenerator() {
    const chars = []
    let rest = (this.newClassSize - (this.newClassSize % acceptChars.length)) / acceptChars.length
    if (rest > 0) {
      while (true) {
        rest -= 1
        const m = rest % acceptChars.length
        const c = acceptChars[m]
        chars.push(c)
        rest -= m
        if (rest === 0) {
          break
        }
        rest /= acceptChars.length
      }
    }
    const prefixIndex = this.newClassSize % acceptChars.length

    const newClassName = `${this.classPrefix}${acceptChars[prefixIndex]}${chars.join('')}`
    return newClassName
  }

  ignoreClassName(className: string): boolean {
    return regExpTest(this.opts.ignoreClass, className)
  }

  includeFilePath(filePath: string): boolean {
    const { include } = this.opts
    if (Array.isArray(include)) {
      return regExpTest(include, filePath)
    } else {
      return true
    }
  }

  excludeFilePath(filePath: string): boolean {
    const { exclude } = this.opts
    if (Array.isArray(exclude)) {
      return regExpTest(exclude, filePath)
    } else {
      return false
    }
  }

  isFileIncluded(filePath: string) {
    return this.includeFilePath(filePath) && !this.excludeFilePath(filePath)
  }

  transformCssClass(className: string): string {
    const key = stripEscapeSequence(className)
    const cn = this.newClassMap[key]
    if (cn) return cn.name
    return className
  }

  generateClassName(original: string): IMangleContextClass {
    const opts = this.opts

    original = stripEscapeSequence(original)
    const cn = this.newClassMap[original]
    if (cn) return cn

    let newClassName
    if (opts.classGenerator) {
      newClassName = opts.classGenerator(original, opts, this.context)
    }
    if (!newClassName) {
      newClassName = this.defaultClassGenerator()
    }

    if (opts.reserveClassName && regExpTest(opts.reserveClassName, newClassName)) {
      if (opts.log) {
        console.log(`The class name has been reserved. ${newClassName}`)
      }
      this.newClassSize++
      return this.generateClassName(original)
    }
    if (opts.log) {
      console.log(`Minify class name from ${original} to ${newClassName}`)
    }
    const newClass: IMangleContextClass = {
      name: newClassName,
      usedBy: []
    }
    this.newClassMap[original] = newClass
    this.newClassSize++
    return newClass
  }
}

export default ClassGenerator
