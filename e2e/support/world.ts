import { World, IWorldOptions } from '@cucumber/cucumber'
import { BrowserContext, Page } from '@playwright/test'

export class CustomWorld extends World {
  context!: BrowserContext
  page!: Page

  constructor(options: IWorldOptions) {
    super(options)
  }
}
