node build.js &&           \
rsync -av --progress --del \
      --exclude=\".*\"     \
      --include=.htaccess  \
      build/               \
      dreamhost:wwwroot    \
&& \
rsync -av --progress --del \
      --exclude=\".*\"     \
      --include=.htaccess  \
      redirect/            \
      dreamhost:redirect