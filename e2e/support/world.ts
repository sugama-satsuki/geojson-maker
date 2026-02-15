import { World, IWorldOptions } from '@cucumber/cucumber'
import { BrowserContext, Page } from '@playwright/test'

export class CustomWorld extends World {
  context!: BrowserContext
  page!: Page
  panelInitialX!: number
  panelInitialY!: number

  constructor(options: IWorldOptions) {
    super(options)
  }
}
