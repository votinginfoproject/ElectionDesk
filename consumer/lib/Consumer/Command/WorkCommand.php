<?php namespace Consumer\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class WorkCommand extends Command {

    protected function configure()
    {
        $this
            ->setName('work')
            ->setDescription('Starts a single consumer')
            ->addArgument(
                'consumer',
                InputArgument::REQUIRED,
                'twitter|facebook|google|datasift|gnip'
            )
            ->addArgument(
                'filter',
                InputArgument::OPTIONAL,
                'id'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
    	$consumer = \Consumer\Consumer::resolve($input->getArgument('consumer'));

        $consumerName = get_class($consumer);

        if ($consumer instanceof \Consumer\IndividualConsumer\IndividualConsumer) {
            $filter = \Consumer\Model\Filter::find($input->getArgument('filter'));
            $output->writeln('Consuming "'. $consumerName .'" with filter "'. $filter->title .'"');

            $consumer->consume($filter);
        } elseif ($consumer instanceof \Consumer\GnipConsumer) {
            $endpoints = explode('|', GNIP_ENDPOINTS);
            $index = $input->getArgument('filter');

            $output->writeln('Consuming "'. $consumerName .'" (Index ' . $index . ')');
            $consumer->setEndpoint($endpoints[$index]);
            $consumer->consume(\Consumer\Model\Filter::all());
        } else {
            $output->writeln('Consuming "'. $consumerName .'"');
            $consumer->consume(\Consumer\Model\Filter::all());
        }
    }

}