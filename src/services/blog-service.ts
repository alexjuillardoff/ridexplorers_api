import { __BLOG_FEEDS_DB_FILENAME__ } from '@app/constants';
import JsonDB from '@app/db';
import { slugify } from '@app/utils';
import { Service } from '@lib/decorators';
import { promises as fs } from 'fs';
import path from 'path';

@Service()
/**
 * Service très simple de gestion de petits billets de blog stockés dans des
 * fichiers JSON. Chaque flux est identifié par un slug et contient un objet
 * libre représentant son contenu.
 */
export default class BlogService {
  private _db: JsonDB;
  private _dbPath: string;

  constructor() {
    // Prépare la base de données et crée le fichier des flux s'il n'existe pas.
    this._db = JsonDB.getInstance();
    this._db.createDBFile(__BLOG_FEEDS_DB_FILENAME__, {});
    this._dbPath = path.join(process.cwd(), 'src', 'db');
  }

  /**
   * Liste tous les flux disponibles (slug + nom).
   */
  public async listFeeds(): Promise<{ name: string; slug: string }[]> {
    const feeds = await this._db.readDBFile<Record<string, { id: string; name: string }>>(
      __BLOG_FEEDS_DB_FILENAME__
    );
    return Object.keys(feeds).map((slug) => ({ slug, name: feeds[slug].name }));
  }

  /**
   * Crée un nouveau flux et retourne ses informations de base.
   */
  public async createFeed(name: string): Promise<{ name: string; slug: string }> {
    const slug = slugify(name);
    const feeds = await this._db.readDBFile<Record<string, { id: string; name: string }>>(
      __BLOG_FEEDS_DB_FILENAME__
    );
    if (feeds[slug]) {
      throw new Error('Feed already exists');
    }
    await this._db.createDBFile(`blog-${slug}`, {});
    await this._db.pushKeyObjectToDB(__BLOG_FEEDS_DB_FILENAME__, {
      [slug]: { id: slug, name },
    });
    return { name, slug };
  }

  /**
   * Récupère le contenu d'un flux. Lance une erreur si le flux n'existe pas.
   */
  public async getFeed(slug: string): Promise<any> {
    try {
      return await this._db.readDBFile<any>(`blog-${slug}`);
    } catch {
      throw new Error(`Feed ${slug} not found`);
    }
  }

  /**
   * Remplace le contenu complet d'un flux.
   */
  public async updateFeed(slug: string, content: any): Promise<void> {
    await this._db.writeDBFile(`blog-${slug}`, content);
  }

  /**
   * Supprime un flux ainsi que son fichier associé.
   */
  public async deleteFeed(slug: string): Promise<void> {
    const feeds = await this._db.readDBFile<Record<string, { id: string; name: string }>>(
      __BLOG_FEEDS_DB_FILENAME__
    );
    if (!feeds[slug]) {
      throw new Error(`Feed ${slug} not found`);
    }
    delete feeds[slug];
    await this._db.writeDBFile(__BLOG_FEEDS_DB_FILENAME__, feeds);
    await fs.rm(path.join(this._dbPath, `blog-${slug}.json`), { force: true });
  }

  /**
   * Renomme un flux en mettant à jour son slug et son nom d'affichage.
   */
  public async renameFeed(
    slug: string,
    newName: string
  ): Promise<{ name: string; slug: string }> {
    const feeds = await this._db.readDBFile<Record<string, { id: string; name: string }>>(
      __BLOG_FEEDS_DB_FILENAME__
    );
    if (!feeds[slug]) {
      throw new Error(`Feed ${slug} not found`);
    }
    const newSlug = slugify(newName);
    if (feeds[newSlug]) {
      throw new Error('Feed already exists');
    }
    await fs.rename(
      path.join(this._dbPath, `blog-${slug}.json`),
      path.join(this._dbPath, `blog-${newSlug}.json`)
    );
    delete feeds[slug];
    feeds[newSlug] = { id: newSlug, name: newName };
    await this._db.writeDBFile(__BLOG_FEEDS_DB_FILENAME__, feeds);
    return { name: newName, slug: newSlug };
  }
}
