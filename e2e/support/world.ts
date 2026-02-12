import { World, IWorldOptions } from '@cucumber/cucumber'
import { Browser, BrowserContext, Page } from '@playwright/test'

export class CustomWorld extends World {
  browser!: Browser
  context!: BrowserContext
  page!: Page
  panelInitialX!: number
  panelInitialY!: number

  constructor(options: IWorldOptions) {
    super(options)
  }
}
