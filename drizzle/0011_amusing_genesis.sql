CREATE INDEX "feed_comments_feed_id_idx" ON "feed_comments" USING btree ("feed_id");--> statement-breakpoint
CREATE INDEX "feed_comments_user_id_idx" ON "feed_comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "feed_reactions_feed_id_idx" ON "feed_reactions" USING btree ("feed_id");--> statement-breakpoint
CREATE INDEX "feed_reactions_user_feed_idx" ON "feed_reactions" USING btree ("user_id","feed_id");